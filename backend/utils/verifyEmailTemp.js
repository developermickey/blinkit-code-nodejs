const veryfyEmailTemp = ({ name, url }) => {
  return `
    <h2>Hello ${name},</h2>
    <h3>Thank you for registering with BlinkIt!</h3>
    <a href="${url}" style="text-decoration: none;">
      <button style="margin-top: 15px; color: #fff; background-color: blue; padding: 10px 15px;border-radius: 10px; border: none; cursor: pointer;">
        Verify Email
      </button>
    </a>
  `;
};

module.exports = veryfyEmailTemp;
