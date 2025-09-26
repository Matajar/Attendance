const Designation = require('../models/Designation');

async function createDesignation(req, res) {
  const { name, description, level } = req.body;

  // Validation
  if (!name || name.trim() === "") {
    return res
      .status(200)
      .json({ message: "Designation name is required", status: false });
  }

  try {
    // Check if designation with same name already exists
    const checkDesignation = await Designation.findOne({ name: name });
    if (checkDesignation) {
      return res
        .status(200)
        .json({ message: "Designation already exists", status: false });
    }

    const designationForm = new Designation({
      name,
      description: description || "",
      level: level || 1,
    });

    await designationForm.save();

    res.status(200).json({
      message: "Designation created successfully",
      data: designationForm,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function getAllDesignations(req, res) {
  try {
    const designations = await Designation.find();

    res.status(200).json({
      message: "Designations retrieved successfully",
      data: designations,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function getDesignationById(req, res) {
  const { id } = req.params;

  if (!id) {
    return res
      .status(200)
      .json({ message: "Designation ID is required", status: false });
  }

  try {
    const designation = await Designation.findById(id);

    if (!designation) {
      return res
        .status(200)
        .json({ message: "Designation not found", status: false });
    }

    res.status(200).json({
      message: "Designation retrieved successfully",
      data: designation,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function updateDesignation(req, res) {
  const { id } = req.params;
  const { name, description, level } = req.body;

  if (!id) {
    return res
      .status(200)
      .json({ message: "Designation ID is required", status: false });
  }

  // Validate if at least one field is provided for update
  if (!name && !description && level === undefined) {
    return res
      .status(200)
      .json({ message: "At least one field is required for update", status: false });
  }

  try {
    // Check if designation exists
    const existingDesignation = await Designation.findById(id);
    if (!existingDesignation) {
      return res
        .status(200)
        .json({ message: "Designation not found", status: false });
    }

    // Check if name is being updated and if it already exists
    if (name && name !== existingDesignation.name) {
      const checkName = await Designation.findOne({ name: name });
      if (checkName) {
        return res
          .status(200)
          .json({ message: "Designation with this name already exists", status: false });
      }
    }

    const designation = await Designation.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Designation updated successfully",
      data: designation,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function deleteDesignation(req, res) {
  const { id } = req.params;

  if (!id) {
    return res
      .status(200)
      .json({ message: "Designation ID is required", status: false });
  }

  try {
    const designation = await Designation.findById(id);
    if (!designation) {
      return res
        .status(200)
        .json({ message: "Designation not found", status: false });
    }

    await Designation.findByIdAndDelete(id);

    res.status(200).json({
      message: "Designation deleted successfully",
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
  createDesignation,
  getAllDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation
};