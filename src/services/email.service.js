const nodemailer = require('nodemailer');
const { response } = require('../../server');


exports.sendEmail = async(email, otp) => {
    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    }, tls:{
        rejectUnauthorized: false
    }
    });

const mailOptions = {
  from: '"Connext OTP" <connext.devs@gmail.com>', 
  to: email,
  subject: 'OTP Verification',
  text: `Your OTP is ${otp}`, // fallback text for email clients that don't support HTML
  html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; background:white; border-radius:20px  ">
      <div style="background:#6C63FF; padding: 5px; text-align:center;">
          <h2 style="color:white;">Connext OTP Verification</h2>
      </div>
    
      <p>Hello,</p>
      <p>Your One-Time Password (OTP) for account verification is:</p>
      <div style="background: #f4f4f4; padding: 5px; margin:5px; text-align:center; border-radius:10px">
              <h1 style="color:#3a30db">
        ${otp}
      </h1>
      </div>

      <p>This code will expire in <b>5 minutes</b>.</p>
      <p>If you didn’t request this, please ignore this email.</p>
      <br/>
      <p style="font-size: 12px; color: #777;">&copy; ${new Date().getFullYear()} connext. All rights reserved.</p>
    </div>
  `
};


    await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                reject(error)
            } else {
                console.log('Email sent: ' + info.response);
                resolve(info)
            }
            });
    })

}
