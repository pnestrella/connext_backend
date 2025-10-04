const express = require('express');
const route = express.Router();

const controller = require('../../controllers/jobseekers/applications.controller')

    // get requests
//get job application
route.get('/getApplications', controller.getApplications)



//getting applicant for swiping
route.get('/getApplicants', controller.getApplicants)

//getting shortlisted applicants for reviewing
route.get('/getShortlistedApplicants', controller.getShortlistedApplicants)

//getting applicant counts for ux purposes
route.get('/getApplicantCounts', controller.getApplicantCounts)

    //post request
//create job application
route.post('/createApplication', controller.createApplication)

    //patch request

route.patch('/updateApplications', controller.updateApplications)

module.exports = route