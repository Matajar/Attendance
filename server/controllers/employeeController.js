const Employee = require('../models/Employee');

async function createEmployee(req, res) {
  const { name, email, phone, department, designation, salary, joinDate } = req.body;

  // Validation
  if (!name || name.trim() === "") {
    return res
      .status(200)
      .json({ message: "Employee name is required", status: false });
  }

  if (!email || email.trim() === "") {
    return res
      .status(200)
      .json({ message: "Email is required", status: false });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(200)
      .json({ message: "Valid email is required", status: false });
  }

  if (!phone || phone.trim() === "") {
    return res
      .status(200)
      .json({ message: "Phone number is required", status: false });
  }

  if (!department) {
    return res
      .status(200)
      .json({ message: "Department is required", status: false });
  }

  if (!designation) {
    return res
      .status(200)
      .json({ message: "Designation is required", status: false });
  }

  if (!salary || salary <= 0) {
    return res
      .status(200)
      .json({ message: "Valid salary is required", status: false });
  }

  try {
    // Check if employee with same email already exists
    const checkEmployee = await Employee.findOne({ email: email });
    if (checkEmployee) {
      return res
        .status(200)
        .json({ message: "Employee with this email already exists", status: false });
    }

    const employeeForm = new Employee({
      name,
      email,
      phone,
      department,
      designation,
      salary,
      joinDate: joinDate || new Date(),
    });

    await employeeForm.save();
    await employeeForm.populate(['department', 'designation']);

    res.status(200).json({
      message: "Employee created successfully",
      data: employeeForm,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function getAllEmployees(req, res) {
  try {
    const { department, designation } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (designation) filter.designation = designation;

    const employees = await Employee.find(filter)
      .populate('department')
      .populate('designation');

    res.status(200).json({
      message: "Employees retrieved successfully",
      data: employees,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function getEmployeeById(req, res) {
  const { id } = req.params;

  if (!id) {
    return res
      .status(200)
      .json({ message: "Employee ID is required", status: false });
  }

  try {
    const employee = await Employee.findById(id)
      .populate('department')
      .populate('designation');

    if (!employee) {
      return res
        .status(200)
        .json({ message: "Employee not found", status: false });
    }

    res.status(200).json({
      message: "Employee retrieved successfully",
      data: employee,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function updateEmployee(req, res) {
  const { id } = req.params;
  const { name, email, phone, department, designation, salary } = req.body;

  if (!id) {
    return res
      .status(200)
      .json({ message: "Employee ID is required", status: false });
  }

  // Validate if at least one field is provided for update
  if (!name && !email && !phone && !department && !designation && !salary) {
    return res
      .status(200)
      .json({ message: "At least one field is required for update", status: false });
  }

  // Validate email if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(200)
        .json({ message: "Valid email is required", status: false });
    }
  }

  // Validate salary if provided
  if (salary !== undefined && salary <= 0) {
    return res
      .status(200)
      .json({ message: "Valid salary is required", status: false });
  }

  try {
    // Check if employee exists
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return res
        .status(200)
        .json({ message: "Employee not found", status: false });
    }

    // Check if email is being updated and if it already exists
    if (email && email !== existingEmployee.email) {
      const checkEmail = await Employee.findOne({ email: email });
      if (checkEmail) {
        return res
          .status(200)
          .json({ message: "Employee with this email already exists", status: false });
      }
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate(['department', 'designation']);

    res.status(200).json({
      message: "Employee updated successfully",
      data: employee,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function deleteEmployee(req, res) {
  const { id } = req.params;

  if (!id) {
    return res
      .status(200)
      .json({ message: "Employee ID is required", status: false });
  }

  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res
        .status(200)
        .json({ message: "Employee not found", status: false });
    }

    await Employee.findByIdAndDelete(id);

    res.status(200).json({
      message: "Employee deleted successfully",
      data: null,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

// Export functions
module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};