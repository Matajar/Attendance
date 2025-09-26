const Designation = require('../models/Designation');

exports.createDesignation = async (req, res) => {
  try {
    const designation = new Designation(req.body);
    await designation.save();
    res.status(201).json({ success: true, data: designation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllDesignations = async (req, res) => {
  try {
    const designations = await Designation.find();
    res.json({ success: true, data: designations });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getDesignationById = async (req, res) => {
  try {
    const designation = await Designation.findById(req.params.id);
    if (!designation) {
      return res.status(404).json({ success: false, error: 'Designation not found' });
    }
    res.json({ success: true, data: designation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!designation) {
      return res.status(404).json({ success: false, error: 'Designation not found' });
    }
    res.json({ success: true, data: designation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByIdAndDelete(req.params.id);
    if (!designation) {
      return res.status(404).json({ success: false, error: 'Designation not found' });
    }
    res.json({ success: true, message: 'Designation deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};