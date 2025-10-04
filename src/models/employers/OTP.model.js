const {mongoose} = require('../../config/db')


const OTPSchema = new mongoose.Schema({
    email: String,
    otp: String,
    createdAt: {
        type: Date,
        default:Date.now,
    }
})

OTPSchema.index({createdAt: 1}, {expireAfterSeconds:290})

exports.OTP = mongoose.model('Otps', OTPSchema)