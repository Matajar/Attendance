const express = require('express');
const router = express.Router();
const designationController = require('../controllers/designationController');

router.post('/', designationController.createDesignation);
router.get('/', designationController.getAllDesignations);
router.get('/:id', designationController.getDesignationById);
router.put('/:id', designationController.updateDesignation);
router.delete('/:id', designationController.deleteDesignation);

module.exports = router;