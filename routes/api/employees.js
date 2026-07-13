const express = require('express');
const router = express.Router();
const employeesController = require('../../controllers/employeesController');
const ROLE_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(employeesController.getAllEmployees)
    .post(verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Editor), employeesController.createNewEmployee)
    .put(verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Editor), employeesController.updateEmployee)
    .delete(verifyRoles(ROLE_LIST.Admin), employeesController.deleteEmployee);

router.route('/:id')
    .get(employeesController.getEmployee);

module.exports = router;