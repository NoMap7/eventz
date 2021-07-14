const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  try {
    //create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    //define mail options
    const mailOptions = {
      from: '<ordinary@noreply.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
    };
    //send mail
    await transporter.sendMail(mailOptions);
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Error sending reset token',
    });
  }
};

module.exports = sendMail;
