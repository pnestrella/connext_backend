const express = require('express');
const router = express.Router();

const controller = require('../../controllers/employers.controller')

//register employers
router.post('/registerEmployers', controller.registerEmployers)
//get an employer's details
router.get('/getEmployer' , controller.getEmployer)
//update an employer's profile
router.patch('/updateProfile/:id', controller.updateProfile)

module.exports = router;
