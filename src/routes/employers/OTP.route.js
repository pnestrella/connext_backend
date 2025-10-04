const express = require('express');
const router = express.Router()

//controller imports
const controller = require('../../controllers/OTP.controller')

//sending otp
router.post('/sendOTP', controller.sendOTP)
router.post('/verifyOTP', controller.verifyOTP)

module.exports = router