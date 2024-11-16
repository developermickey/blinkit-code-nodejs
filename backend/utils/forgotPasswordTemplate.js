const forgotPasswordTemplate = ({ name, otp }) => {
  return `
      <h2>Hello ${name},</h2>
      <h3>Here your 6 digit OTP for reset your password.</h3>
        <div style="width: 50px; margin-top: 15px; color: #fff; background-color: blue; padding: 10px 15px;border-radius: 10px; border: none; cursor: pointer;">
            ${otp}
        </div>
        <p>Please do not share this OTP with anyone.</p>
        <p>It's valid for 1 hours.</p>
        <br>
        <br>
        <br>
        <p>Thanks,</p>
        <p>BlinkIt Team.</p>:
      
    `;
};

module.exports = forgotPasswordTemplate;
