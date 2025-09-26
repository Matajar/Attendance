const Department = require('../models/Department');

async function createDepartment(req, res) {
  const { name, description } = req.body;

  // Validation
  if (!name || name.trim() === "") {
    return res
      .status(200)
      .json({ message: "Department name is required", status: false });
  }

  try {
    // Check if department with same name already exists
    const checkDepartment = await Department.findOne({ name: name });
    if (checkDepartment) {
      return res
        .status(200)
        .json({ message: "Department already exists", status: false });
    }

    const departmentForm = new Department({
      name,
      description: description || "",
    });

    await departmentForm.save();

    res.status(200).json({
      message: "Department created successfully",
      data: departmentForm,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function getAllDepartments(req, res) {
  try {
    const departments = await Department.find();

    res.status(200).json({
      message: "Departments retrieved successfully",
      data: departments,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function getDepartmentById(req, res) {
  const { id } = req.params;

  if (!id) {
    return res
      .status(200)
      .json({ message: "Department ID is required", status: false });
  }

  try {
    const department = await Department.findById(id);

    if (!department) {
      return res
        .status(200)
        .json({ message: "Department not found", status: false });
    }

    res.status(200).json({
      message: "Department retrieved successfully",
      data: department,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function updateDepartment(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!id) {
    return res
      .status(200)
      .json({ message: "Department ID is required", status: false });
  }

  // Validate if at least one field is provided for update
  if (!name && !description) {
    return res
      .status(200)
      .json({ message: "At least one field is required for update", status: false });
  }

  try {
    // Check if department exists
    const existingDepartment = await Department.findById(id);
    if (!existingDepartment) {
      return res
        .status(200)
        .json({ message: "Department not found", status: false });
    }

    // Check if name is being updated and if it already exists
    if (name && name !== existingDepartment.name) {
      const checkName = await Department.findOne({ name: name });
      if (checkName) {
        return res
          .status(200)
          .json({ message: "Department with this name already exists", status: false });
      }
    }

    const department = await Department.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Department updated successfully",
      data: department,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function deleteDepartment(req, res) {
  const { id } = req.params;

  if (!id) {
    return res
      .status(200)
      .json({ message: "Department ID is required", status: false });
  }

  try {
    const department = await Department.findById(id);
    if (!department) {
      return res
        .status(200)
        .json({ message: "Department not found", status: false });
    }

    await Department.findByIdAndDelete(id);

    res.status(200).json({
      message: "Department deleted successfully",
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
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
};