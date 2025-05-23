const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config()
console.log(process.env.GOOGLE_EMAIL)
console.log(process.env.GOOGLE_APP_PASSWORD)

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },

});

module.exports.sendEmail = async (name, email) => {
  try {
    const info = await transporter.sendMail({
      from: '"Event Guidance and Inventory System" <sk3090184@gmail.com>', // fixed incorrect format
      to: email, // fixed "gamil.com" typo
      subject: "Welcome Message",
      text: `Hello ${name}`,
      html: "<b>Welcome To Event Guidance And Inventory System</b>",
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

