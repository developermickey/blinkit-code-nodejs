const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API);

const sendEmail = async ({ sendTo, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: "BlinkIt <onboarding@resend.dev>",
      to: sendTo,
      subject: subject,
      html: html,
    });
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
