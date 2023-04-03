const imgbbUploader = require("imgbb-uploader");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.uploadImage = async(file) => {
  try{
   const response = await imgbbUploader(process.env.IMGBB_API_KEY,file.path);
   console.log(response.url);
   return response.url;
  }catch(err){
    console.log(err);
    return false;
  }
}

exports.signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.sendMail = async (options) => {
  // create a transporter instance
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define the email options
  const mailOptions = {
    from: "Food Delivery <simon_zeidan@hotmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // send the mail

  await transporter.sendMail(mailOptions);
};