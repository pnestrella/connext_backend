//import Models
const {
    OTP
} = require('../models/employers/OTP.model')
const {
    jobseekersModel
} = require('../models/jobseekers/jobseekers.model')
const {
    employersModel
} = require('../models/employers/employers.model')



const crypto = require('crypto')
//services imports
const {
    sendEmail
} = require('../services/email.service')

//send OTP to validate whether the user email is valid
exports.sendOTP = async (req, res) => {
    const {
        email,
    } = req.body

    console.log(req.body);
    const otp = crypto.randomInt(100000, 999999).toString()
    try {
        // const find = await OTP.create({email})
        //validation if the account exist

        //check if the JOB SEEKER ACCOUNT already EXIST
        const verifyExistence = await jobseekersModel.findOne({
            email: email
        })

        const verifyExistenceEmployer = await employersModel.findOne({
            email: email
        })

        console.log(verifyExistence && verifyExistenceEmployer);

        if (verifyExistence || verifyExistenceEmployer) {
            console.log("Account is there ", email);
            res.status(400).json({
                success: false,
                error: {
                    message: "Email is already used",
                    code: "EMAIL_ALREADY_IN_USE"
                }
            })
            return;
        } else {
            console.log("Email can be used");
        }


        //Validation for the OTP
        const verifyOTPExistence = await OTP.findOne({
            email
        })



        if (verifyOTPExistence) {

            console.log(verifyOTPExistence.createdAt.getTime());
            const ageInSeconds = (Date.now() - verifyOTPExistence.createdAt.getTime()) / 1000;
            if (ageInSeconds > 290) {
                // Optionally clean up immediately
                await OTP.deleteOne({
                    _id: verifyOTPExistence._id
                });

                console.log("Cleaned The OTP");
            } else {
                console.log("The OTP still EXIST!");
                res.status(400).json({
                    success: false,
                    error: {
                        message: "Please wait at least 5 minutes before requesting another OTP.",
                        code: "OTP_REQUEST_LIMIT"
                    }
                });
                return;
            }
        }

        //Backlogging the OTP Request to Mongodb
        await OTP.create({
            email,
            otp
        })
        console.log("Successfully added OTP in the DB");

        //sending email to the user
        await sendEmail(email, otp)
        console.log("Sent the email successfully");

        //response to the frontend
        res.status(200).json({
            success: true,
            message: "Sent the email successfully. Please check your Email",
            "expiresIn": 300
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: err
        })
    }
}

//verifying OTP
exports.verifyOTP = async (req, res) => {
    const {
        email,
        otp
    } = req.body;

    console.log(email, otp, '-----------------');
    try {
        const verified = await OTP.findOne({
            email,
            otp
        })

        console.log(verified, 'tetsttt');
        if (!verified) {
            res.status(400).json({
                success: false,
                error: {
                    message: "The OTP you entered is incorrect.",
                    code: "INVALID_OTP"
                }
            })
            return;
        }

        console.log(verified);
        await OTP.deleteOne(verified)
        console.log("Successfully deleted");

        res.status(200).json({
            success: true,
            message: "OTP Verified successfully."
        })

    } catch (err) {
        res.status(400).json({
            success: false,
            message: err
        })
    }
}